<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hardware extends Model
{
    use HasFactory;

    protected $table = 'hardwares';

    protected $fillable = [
        'hardware_no',
        'hardware_serial_no',
        'assigned_user_id',
        'hardware_type_id',
        'hardware_status_id',
    ];

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(AssignedUser::class);
    }

    public function hardwareType(): BelongsTo
    {
        return $this->belongsTo(HardwareType::class);
    }

    public function hardwareStatus(): BelongsTo
    {
        return $this->belongsTo(HardwareStatus::class);
    }

    public function updateRecords(): HasMany
    {
        return $this->hasMany(UpdateRecord::class);
    }
}