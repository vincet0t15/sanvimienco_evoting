<?php

namespace App\Imports;

use App\Models\Voter;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class VotersImport implements SkipsEmptyRows, ToModel, WithHeadingRow, WithValidation
{
    public function __construct(private readonly int $eventId) {}

    public function model(array $row): Voter
    {
        $name = trim((string) ($row['name'] ?? ''));
        $username = trim((string) ($row['username'] ?? ''));
        $password = (string) ($row['password'] ?? '');

        $isActiveRaw = $row['is_active'] ?? true;
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
            '*.name' => ['required', 'string', 'max:255'],
            '*.username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('voters', 'username'),
            ],
            '*.password' => ['required', 'string', 'min:6'],
            '*.is_active' => ['nullable'],
        ];
    }
}
