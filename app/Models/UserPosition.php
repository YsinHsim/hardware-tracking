<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'position_name',
        'position_desc',
    ];

    public function assignedUsers(): HasMany
    {
        return $this->hasMany(AssignedUser::class);
    }
}