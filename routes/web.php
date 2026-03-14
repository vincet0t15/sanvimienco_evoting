<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\VoterImportController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Events
    Route::get('events', [EventController::class, 'index'])->name('events.index');
    Route::post('events', [EventController::class, 'store'])->name('events.store');
    Route::put('events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('events/{event}/voters/import', [VoterImportController::class, 'store'])
        ->name('events.voters.import');

    // Positions
    Route::get('positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('positions', [PositionController::class, 'store'])->name('positions.store');
    Route::put('positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    Route::post('positions/reorder', [PositionController::class, 'reorder'])->name('positions.reorder');

    // Voters
    Route::get('voters', [VoterController::class, 'index'])->name('voters.index');
    Route::post('voters', [VoterController::class, 'store'])->name('voters.store');
});

require __DIR__.'/settings.php';
