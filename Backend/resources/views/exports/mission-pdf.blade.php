<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
        h1 { color: #653239; }
        .header { border-bottom: 2px solid #653239; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #653239; color: #fff; padding: 8px; text-align: left; }
        td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) td { background: #f9f9f9; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
        .info { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport de Mission</h1>
    </div>
    <div class="info"><strong>Titre :</strong> {{ $mission->title }}</div>
    <div class="info"><strong>Date :</strong> {{ $mission->date->format('d/m/Y') }}</div>
    <div class="info"><strong>Lieu :</strong> {{ $mission->location }}</div>
    <div class="info"><strong>Places totales :</strong> {{ $mission->available_places + $participants->count() }}</div>
    <div class="info"><strong>Inscrits :</strong> {{ $participants->count() }}</div>

    <table>
        <thead>
            <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date d'inscription</th>
            </tr>
        </thead>
        <tbody>
            @foreach($participants as $p)
            @php $parts = explode(' ', $p->name, 2); @endphp
            <tr>
                <td>{{ $parts[1] ?? '' }}</td>
                <td>{{ $parts[0] }}</td>
                <td>{{ $p->email }}</td>
                <td>{{ $p->phone ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($p->pivot->registered_at)->format('d/m/Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Exporté le {{ $exportDate }} — Page <span class="page"></span>
    </div>
</body>
</html>