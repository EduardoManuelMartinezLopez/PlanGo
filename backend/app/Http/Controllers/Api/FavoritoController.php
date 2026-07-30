<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinoResource;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    /**
     * GET /api/favoritos
     */
    public function index(Request $request)
    {
        return DestinoResource::collection(
            $request->user()->favoritos()->with('categorias')->paginate(10)
        );
    }

    /**
     * POST /api/favoritos/{destino}
     * Agrega o quita el destino de favoritos según si ya estaba
     * (esto es lo que se llama "toggle").
     */
    public function alternar(Request $request, int $destinoId)
    {
        $usuario = $request->user();

        $yaEsFavorito = $usuario->favoritos()->where('destino_id', $destinoId)->exists();

        if ($yaEsFavorito) {
            $usuario->favoritos()->detach($destinoId);
            return response()->json(['favorito' => false]);
        }

        $usuario->favoritos()->attach($destinoId);
        return response()->json(['favorito' => true]);
    }
}
