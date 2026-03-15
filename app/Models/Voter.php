<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Voter extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'username',
        'password',
        'is_active',
        'has_voted',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'has_voted' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
