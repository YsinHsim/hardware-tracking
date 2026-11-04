<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class BranchController extends Controller
{
    private const VALIDATION_ATTRIBUTES = [
        'branch_name' => 'branch name',
        'region_id' => 'region',
    ];

    /**
     * Display a listing of the branches.
     */
    public function index(Request $request)
    {
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $regionId = $request->integer('region_id') ?: null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $branches = Branch::with('region')
            ->when($search !== '', function ($query) use ($search) {
                $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("branch_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereHas('region', fn ($query) => $query->whereRaw("region_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($regionId, fn ($query) => $query->where('region_id', $regionId))
            ->orderBy('branch_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Branches/Index', [
            'branches' => $branches,
            'filters' => [
                'search' => $search,
                'region_id' => $regionId,
                'per_page' => $perPage,
            ],
            'total' => $branches->total(),
            'regions' => Region::query()->select('id', 'region_name')->orderBy('region_name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new branch.
     */
    public function create()
    {
        $regions = Region::all();
        $branches = Branch::all();
        return Inertia::render('Branches/Create', [
            'branches' => $branches,
            'regions' => $regions,
        ]);
    }

    /**
     * Store a newly created branch in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:255',
            'region_id' => 'required|exists:regions,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        Branch::create($validated);

        // return Redirect::route('branches.index')->with('success', 'Branch created successfully.');
        return Redirect::back()->with('success', 'Branch created successfully.');
    }

    /**
     * Show the form for editing an branch.
     */
    public function edit(Branch $branch)
    {
        $regions = Region::all();
        return Inertia::render('Branches/Edit', [
            'branch' => $branch,
            'regions' => $regions,
        ]);
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:255',
            'region_id' => 'required|exists:regions,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        $branch->update($validated);

        return Redirect::route('branches.index')->with('success', 'Branch updated successfully.');
    }

    /**
     * Remove the specified branch from storage.
     */
    public function destroy(Branch $branch)
    {
        $assignedUserCount = $branch->assignedUsers()->count();

        if ($assignedUserCount > 0) {
            $assignedUserLabel = Str::plural('assigned user', $assignedUserCount);
            $verb = $assignedUserCount === 1 ? 'belongs' : 'belong';
            return back()->withErrors(['delete' => "Cannot delete branch \"{$branch->branch_name}\": {$assignedUserCount} {$assignedUserLabel} still {$verb} to it. Move or delete them first."]);
        }

        $branch->delete();
        return Redirect::route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}
