<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'position_id',
        'name',
        'photo_path',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}

