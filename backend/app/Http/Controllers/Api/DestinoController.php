<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDestinoRequest;
use App\Http\Requests\UpdateDestinoRequest;
use App\Http\Resources\DestinoResource;
use App\Models\Destino;
use Illuminate\Http\Request;

class DestinoController extends Controller
{
    /**
     * GET /api/destinos
     * Paginación y filtros SIEMPRE del lado del servidor, tal como pide
     * la rúbrica (nada de traer todo y filtrar en React).
     */
    public function index(Request $request)
    {
        $query = Destino::with(['categorias', 'resenas']);

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%' . $request->input('buscar') . '%');
        }

        if ($request->filled('categoria_id')) {
            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias.id', $request->input('categoria_id'));
            });
        }

        $porPagina = (int) $request->input('limit', 10);
        $destinos = $query->paginate($porPagina)->withQueryString();

        return DestinoResource::collection($destinos);
    }

    public function store(StoreDestinoRequest $request)
    {
        $datos = $request->validated();

        $destino = Destino::create($datos);

        if (!empty($datos['categorias'])) {
            $destino->categorias()->sync($datos['categorias']);
        }

        return new DestinoResource($destino->load('categorias'));
    }

    public function show(Destino $destino)
    {
        return new DestinoResource(
            $destino->load(['categorias', 'resenas.usuario'])
        );
    }

    public function update(UpdateDestinoRequest $request, Destino $destino)
    {
        $datos = $request->validated();

        $destino->update($datos);

        if (isset($datos['categorias'])) {
            $destino->categorias()->sync($datos['categorias']);
        }

        return new DestinoResource($destino->load('categorias'));
    }

    public function destroy(Destino $destino)
    {
        $destino->delete();

        return response()->json(['message' => 'Destino eliminado correctamente.']);
    }
}
