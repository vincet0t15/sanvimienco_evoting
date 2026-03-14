<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'voter_id',
        'position_id',
        'candidate_id',
    ];

    public function voter()
    {
        return $this->belongsTo(Voter::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
