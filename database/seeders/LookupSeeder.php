<?php

namespace Database\Seeders;

use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\Region;
use App\Models\UserPosition;
use Illuminate\Database\Seeder;

class LookupSeeder extends Seeder
{
    /**
     * Curated lookup values shared by every install. Seeded with
     * firstOrCreate so re-running the seeder never duplicates rows.
     */
    public function run(): void
    {
        $regions = [
            'Kota Kinabalu',
            'Penampang',
            'Putatan',
            'Papar',
            'Kota Belud',
            'Kudat',
            'Ranau',
            'Sandakan',
            'Lahad Datu',
            'Tawau',
            'Semporna',
            'Keningau',
            'Tenom',
            'Beaufort',
            'Sipitang',
        ];

        foreach ($regions as $regionName) {
            Region::firstOrCreate(['region_name' => $regionName]);
        }

        $hardwareTypes = [
            ['hardware_type_name' => 'Laptop', 'hardware_type_desc' => 'Portable notebook computer'],
            ['hardware_type_name' => 'Desktop', 'hardware_type_desc' => 'Tower or mini-PC workstation'],
            ['hardware_type_name' => 'Monitor', 'hardware_type_desc' => 'External display screen'],
            ['hardware_type_name' => 'Printer', 'hardware_type_desc' => 'Laser or inkjet printer'],
            ['hardware_type_name' => 'Router', 'hardware_type_desc' => 'Network router or access point'],
            ['hardware_type_name' => 'Scanner', 'hardware_type_desc' => 'Document or barcode scanner'],
        ];

        foreach ($hardwareTypes as $type) {
            HardwareType::firstOrCreate(
                ['hardware_type_name' => $type['hardware_type_name']],
                ['hardware_type_desc' => $type['hardware_type_desc']]
            );
        }

        $hardwareStatuses = [
            'Active',
            'In Store',
            'Under Repair',
            'Faulty',
            'Retired',
        ];

        foreach ($hardwareStatuses as $statusName) {
            HardwareStatus::firstOrCreate(['hardware_status_name' => $statusName]);
        }

        $userPositions = [
            ['position_name' => 'Manager', 'position_desc' => 'Oversees department or branch operations'],
            ['position_name' => 'Executive', 'position_desc' => 'Handles administrative and operational tasks'],
            ['position_name' => 'Supervisor', 'position_desc' => 'Supervises daily staff activities'],
            ['position_name' => 'Clerk', 'position_desc' => 'Office and record administration'],
            ['position_name' => 'Technician', 'position_desc' => 'Equipment maintenance and support'],
            ['position_name' => 'Intern', 'position_desc' => 'Trainee on short-term placement'],
        ];

        foreach ($userPositions as $position) {
            UserPosition::firstOrCreate(
                ['position_name' => $position['position_name']],
                ['position_desc' => $position['position_desc']]
            );
        }
    }
}
