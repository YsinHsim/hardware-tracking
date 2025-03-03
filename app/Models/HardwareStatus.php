<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HardwareStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'hardware_status_name',
    ];

    public function hardwares(): HasMany
    {
        return $this->hasMany(Hardware::class);
    }
}