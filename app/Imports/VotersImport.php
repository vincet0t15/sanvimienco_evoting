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
            ->map(fn ($username) => (string) $username)
            ->flip()
            ->all();
    }

    public function model(array $row): ?Voter
    {
        $name = $this->normalizeName((string) ($row['name'] ?? ($row[0] ?? '')));
        if ($this->isHeaderRow($row, $name)) {
            return null;
        }

        $usernameBase = $name;
        $username = $this->uniqueUsername($usernameBase);
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
            'is_active' => $isActive,
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

    private function uniqueUsername(string $base): string
    {
        $base = $this->normalizeName($base);
        $base = $base !== '' ? $base : 'voter';

        $candidate = $base;
        $suffix = 2;

        while (isset($this->takenUsernameSet[$candidate])) {
            $maxBaseLength = 255 - (strlen((string) $suffix) + 1);
            $trimmedBase = mb_substr($base, 0, max(1, $maxBaseLength));
            $candidate = $trimmedBase.'-'.$suffix;
            $suffix++;
        }

        $this->takenUsernameSet[$candidate] = true;

        return $candidate;
    }
}
