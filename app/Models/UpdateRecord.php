<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpdateRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_name',
        'record_desc',
        'record_last_updated',
        'hardware_id',
    ];

    protected $casts = [
        'record_last_updated' => 'datetime',
    ];

    public function hardware(): BelongsTo
    {
        return $this->belongsTo(Hardware::class);
    }
}