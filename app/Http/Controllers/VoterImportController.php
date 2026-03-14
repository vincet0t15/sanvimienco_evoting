<?php

namespace App\Http\Controllers;

use App\Imports\VotersImport;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class VoterImportController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        try {
            Excel::import(new VotersImport($event->id), $validated['file']);
        } catch (ValidationException $e) {
            $firstFailure = $e->failures()[0] ?? null;
            $message = $firstFailure
                ? 'Import failed at row '.$firstFailure->row().': '.implode(', ', $firstFailure->errors())
                : 'Import failed due to invalid data.';

            return back()->withErrors([
                'file' => $message,
            ]);
        }

        return back();
    }
}
