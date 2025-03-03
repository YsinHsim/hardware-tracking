<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssignedUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_name',
        'user_position_id',
        'estate_id',
    ];

    public function userPosition(): BelongsTo
    {
        return $this->belongsTo(UserPosition::class);
    }

    public function estate(): BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    public function hardwares(): HasMany
    {
        return $this->hasMany(Hardware::class);
    }
}