<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HardwareType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hardware_type_name',
        'hardware_type_desc',
    ];

    public function hardwares(): HasMany
    {
        return $this->hasMany(Hardware::class);
    }
}