<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Event;
use App\Models\Position;
use App\Models\Vote;
use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoterAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_voter_login_screen_can_be_rendered(): void
    {
        Event::create([
            'name' => 'Test Event',
            'start_at' => now(),
            'end_at' => now()->addDay(),
        ]);

        $response = $this->get('/voter/login');

        $response->assertStatus(200);
    }

    public function test_voter_can_login_and_access_voter_dashboard(): void
    {
        $event = Event::create([
            'name' => 'Test Event',
            'start_at' => now(),
            'end_at' => now()->addDay(),
        ]);

        $voter = Voter::create([
            'event_id' => $event->id,
            'name' => 'Voter One',
            'username' => 'voter1',
            'password' => 'secret123',
            'is_active' => true,
        ]);

        $response = $this->post('/voter/login', [
            'username' => $voter->username,
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/voter/dashboard');

        $dashboard = $this->get('/voter/dashboard');
        $dashboard->assertStatus(200);
    }

    public function test_voter_cannot_login_when_inactive(): void
    {
        $event = Event::create([
            'name' => 'Test Event',
            'start_at' => now(),
            'end_at' => now()->addDay(),
        ]);

        Voter::create([
            'event_id' => $event->id,
            'name' => 'Voter One',
            'username' => 'voter1',
            'password' => 'secret123',
            'is_active' => false,
        ]);

        $response = $this->from('/voter/login')->post('/voter/login', [
            'username' => 'voter1',
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/voter/login');
        $response->assertSessionHasErrors(['username']);
    }

    public function test_voter_can_submit_votes_from_dashboard(): void
    {
        $event = Event::create([
            'name' => 'Test Event',
            'start_at' => now()->subMinute(),
            'end_at' => now()->addDay(),
        ]);

        $position = Position::create([
            'event_id' => $event->id,
            'name' => 'President',
            'max_vote' => 1,
            'sort_order' => 1,
        ]);

        $candidateA = Candidate::create([
            'event_id' => $event->id,
            'position_id' => $position->id,
            'name' => 'Candidate A',
            'photo_path' => null,
        ]);

        $candidateB = Candidate::create([
            'event_id' => $event->id,
            'position_id' => $position->id,
            'name' => 'Candidate B',
            'photo_path' => null,
        ]);

        Voter::create([
            'event_id' => $event->id,
            'name' => 'Voter One',
            'username' => 'voter1',
            'password' => 'secret123',
            'is_active' => true,
        ]);

        $this->post('/voter/login', [
            'username' => 'voter1',
            'password' => 'secret123',
        ])->assertRedirect('/voter/dashboard');

        $this->post('/voter/vote', [
            'votes' => [
                (string) $position->id => [$candidateA->id],
            ],
        ])->assertRedirect('/voter/login');

        $this->assertDatabaseHas('votes', [
            'event_id' => $event->id,
            'position_id' => $position->id,
            'candidate_id' => $candidateA->id,
        ]);

        $this->get('/voter/dashboard')->assertRedirect('/voter/login');

        $this->assertDatabaseMissing('votes', [
            'event_id' => $event->id,
            'position_id' => $position->id,
            'candidate_id' => $candidateB->id,
        ]);

        $this->post('/voter/login', [
            'username' => 'voter1',
            'password' => 'secret123',
        ])->assertRedirect('/voter/dashboard');

        $this->post('/voter/vote', [
            'votes' => [
                (string) $position->id => [$candidateA->id, $candidateB->id],
            ],
        ])->assertSessionHasErrors(['votes']);

        $this->assertSame(
            1,
            Vote::query()->where('event_id', $event->id)->count(),
        );
    }
}
