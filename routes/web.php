<?php

use App\Http\Controllers\CandidateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ResultsController;
use App\Http\Controllers\VoterAuthController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\VoterImportController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Events
    Route::get('events', [EventController::class, 'index'])->name('events.index');
    Route::post('events', [EventController::class, 'store'])->name('events.store');
    Route::put('events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::put('events/{event}/active', [EventController::class, 'setActive'])->name('events.active');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('events/{event}/voters/import', [VoterImportController::class, 'store'])
        ->name('events.voters.import');

    // Positions
    Route::get('positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('positions', [PositionController::class, 'store'])->name('positions.store');
    Route::put('positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    Route::post('positions/reorder', [PositionController::class, 'reorder'])->name('positions.reorder');

    // Candidates
    Route::get('candidates', [CandidateController::class, 'index'])->name('candidates.index');
    Route::post('candidates', [CandidateController::class, 'store'])->name('candidates.store');
    Route::put('candidates/{candidate}', [CandidateController::class, 'update'])->name('candidates.update');
    Route::delete('candidates/{candidate}', [CandidateController::class, 'destroy'])->name('candidates.destroy');

    // Results
    Route::get('results', [ResultsController::class, 'index'])->name('results.index');

    // Voters
    Route::get('voters', [VoterController::class, 'index'])->name('voters.index');
    Route::post('voters', [VoterController::class, 'store'])->name('voters.store');
    Route::patch('voters/active', [VoterController::class, 'bulkActive'])->name('voters.bulk-active');
    Route::patch('voters/{voter}/active', [VoterController::class, 'setActive'])->name('voters.set-active');
    Route::get('voters/print', [VoterController::class, 'print'])->name('voters.print');
    Route::get('voters/{voter}/votes', [VoterController::class, 'votes'])->name('voters.votes');
});

Route::prefix('voter')->name('voter.')->group(function () {
    Route::middleware('guest:voter')->group(function () {
        Route::get('login', [VoterAuthController::class, 'create'])->name('login');
        Route::post('login', [VoterAuthController::class, 'store'])->name('login.store');
    });

    Route::middleware('auth.voter')->group(function () {
        Route::get('dashboard', [VoterAuthController::class, 'dashboard'])->name('dashboard');
        Route::post('vote', [VoterAuthController::class, 'vote'])
            ->middleware('throttle:10,1')
            ->name('vote');
        Route::post('logout', [VoterAuthController::class, 'destroy'])->name('logout');
    });
});

require __DIR__.'/settings.php';
