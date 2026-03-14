<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'max_vote',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'max_vote' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }
}

