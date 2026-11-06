<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hardware extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['assigned_user'];

    protected $table = 'hardwares';

    protected static function booted(): void
    {
        static::saving(function (Hardware $hardware) {
            if (! $hardware->isDirty('user_id')) {
                return;
            }
            $user = $hardware->assigned_user_id ? User::with(['branch', 'position'])->find($hardware->assigned_user_id) : null;
            $hardware->attributes['user_id'] = $user?->id;
            $hardware->assigned_user_name = $user?->name;
            $hardware->assigned_branch_name = $user?->branch?->branch_name;
            $hardware->assigned_position_name = $user?->position?->position_name;
        });
    }

    public function setAssignedUserIdAttribute($value): void
    {
        $this->attributes['user_id'] = $value;
    }

    public function getAssignedUserIdAttribute()
    {
        return $this->attributes['user_id'] ?? null;
    }

    protected $fillable = [
        'hardware_no',
        'hardware_serial_no',
        'assigned_user_id',
        'user_id',
        'assigned_user_name',
        'assigned_branch_name',
        'assigned_position_name',
        'verification_status',
        'submitted_by',
        'hardware_type_id',
        'hardware_status_id',
    ];

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getAssignedUserAttribute(): ?array
    {
        $assignee = $this->getRelationValue('assignedUser');
        if (! $this->attributes['user_id'] && ! $this->assigned_user_name) {
            return null;
        }

        return [
            'id' => $this->attributes['user_id'] ?? null,
            'user_name' => $assignee?->name ?? $this->assigned_user_name,
            'branch' => [
                'branch_name' => $assignee?->branch?->branch_name ?? $this->assigned_branch_name,
            ],
            'user_position' => [
                'position_name' => $assignee?->position?->position_name ?? $this->assigned_position_name,
            ],
        ];
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

    public function verifications(): HasMany
    {
        return $this->hasMany(HardwareVerification::class)->latest();
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}