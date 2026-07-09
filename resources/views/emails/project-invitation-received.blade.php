<x-mail::message>
# Project invitation

You have been invited to collaborate on **{{ $projectInvitation->project->title }}**.

@if($projectInvitation->message)
{{ $projectInvitation->message }}
@endif

<x-mail::button :url="route('projects.show', (string) $projectInvitation->project->slug)">
Open project
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
