<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_type_id' => ['required', 'exists:product_types,id'],
            'serial_number' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'serialInputs' => ['required', 'array'],
            'serialInputs.*.value' => ['required', 'string', 'max:255'],
        ];
    }
    
    protected function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->hasAny(['serialInputs.*.value'])) {
                $messages = [];
                
            // Extract all serialInputs.*.value error messages and include position
            foreach ($validator->errors()->messages() as $key => $errors) {
                if (preg_match('/^serialInputs\.(\d+)\.value/', $key, $matches)) {
                    $position = intval($matches[1]) + 1; // Convert from 0-based to 1-based indexing
                    
                    foreach ($errors as $error) {
                        $friendlyError = str_replace(
                            "serialInputs.{$matches[1]}.value", 
                            "Serial number #{$position}", 
                            $error
                        );
                        $messages[] = $friendlyError;
                    }
                    
                    // Remove the specific nested error
                    $validator->errors()->forget($key);
                }
            }
                
                // Add consolidated error under the parent key
                if (!empty($messages)) {
                    $validator->errors()->add('serialInputs', $messages);
                }
            }
        });
    }
}
