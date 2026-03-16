<?php

namespace App\Imports;

use App\Models\Voter;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithValidation;

class VotersImport implements SkipsEmptyRows, ToModel, WithValidation
{
    private array $takenUsernameSet = [];

    public function __construct(private readonly int $eventId)
    {
        $this->takenUsernameSet = Voter::query()
            ->pluck('username')
            ->map(fn($username) => (string) $username)
            ->flip()
            ->all();
    }

    public function model(array $row): ?Voter
    {
        $name = $this->normalizeName((string) ($row['name'] ?? ($row[0] ?? '')));
        if ($this->isHeaderRow($row, $name)) {
            return null;
        }

        $username = $this->generateUniqueCredentialFromName($name);
        $password = $username;

        $isActiveRaw = $row['is_active'] ?? ($row[3] ?? true);
        $isActive = filter_var($isActiveRaw, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
        if ($isActive === null) {
            $isActive = (bool) $isActiveRaw;
        }

        return new Voter([
            'event_id' => $this->eventId,
            'name' => $name,
            'username' => $username,
            'password' => $password,
            'is_active' => false,
        ]);
    }

    public function rules(): array
    {
        return [
            '*.0' => ['required', 'string', 'max:255'],
            '*.3' => ['nullable'],
        ];
    }

    private function normalizeName(string $value): string
    {
        $value = trim($value);
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return $value;
    }

    private function isHeaderRow(array $row, string $name): bool
    {
        if ($name === '') {
            return false;
        }

        $first = strtolower($name);
        $second = strtolower(trim((string) ($row[1] ?? '')));

        if ($first === 'name' && ($second === '' || $second === 'username')) {
            return true;
        }

        return false;
    }

    private function generateUniqueCredentialFromName(string $name): string
    {
        $letters = $this->extractLetters($name);
        $length = 6;

        for ($attempt = 0; $attempt < 50; $attempt++) {
            $candidate = $this->generateFixedLengthFromLetters($letters, $length);

            if (! isset($this->takenUsernameSet[$candidate])) {
                $this->takenUsernameSet[$candidate] = true;

                return $candidate;
            }
        }

        $alphabet = str_split('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');

        for ($attempt = 0; $attempt < 200; $attempt++) {
            $candidate = $this->generateFixedLengthFromLetters($alphabet, $length);

            if (! isset($this->takenUsernameSet[$candidate])) {
                $this->takenUsernameSet[$candidate] = true;

                return $candidate;
            }
        }

        $candidate = $this->generateFixedLengthFromLetters($alphabet, $length);
        $this->takenUsernameSet[$candidate] = true;

        return $candidate;
    }

    private function extractLetters(string $value): array
    {
        $normalized = $this->normalizeName($value);
        $lettersOnly = preg_replace('/[^a-zA-Z]/', '', $normalized) ?? '';
        $lettersOnly = strtoupper($lettersOnly);

        $letters = array_values(array_filter(str_split($lettersOnly), fn($c) => $c !== ''));

        return $letters !== [] ? $letters : str_split('VOTER');
    }

    private function generateFixedLengthFromLetters(array $letters, int $length): string
    {
        $letters = array_values(array_filter($letters, fn($c) => $c !== ''));

        if (count($letters) === 0) {
            $letters = str_split('VOTER');
        }

        $picked = [];

        $copy = $letters;
        shuffle($copy);
        $picked = array_slice($copy, 0, min($length, count($copy)));

        while (count($picked) < $length) {
            $picked[] = $letters[random_int(0, count($letters) - 1)];
        }

        shuffle($picked);

        return implode('', array_slice($picked, 0, $length));
    }
}
