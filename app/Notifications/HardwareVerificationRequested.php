<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HardwareVerificationRequested extends Notification
{
    public function __construct(public int $hardwareId, public string $hardwareNo) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'hardware_id' => $this->hardwareId,
            'hardware_no' => $this->hardwareNo,
            'title' => 'Hardware verification requested',
            'message' => "{$this->hardwareNo} needs assignment verification.",
            'url' => route('verification.index'),
        ];
    }
}
