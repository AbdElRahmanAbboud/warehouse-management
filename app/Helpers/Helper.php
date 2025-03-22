<?php

namespace App\Helpers;

use Illuminate\Http\Request;

if (! function_exists('store_or_update_image')) {
    function store_or_update_image(Request $request, object $entity, string $field = 'image', string $collection = 'images'): void
    {
        if ($request->hasFile($field)) {
            $entity->clearMediaCollection($collection);
            $entity->addMediaFromRequest($field)->toMediaCollection($collection);
        }
    }
}
