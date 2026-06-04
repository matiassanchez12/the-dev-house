export default function Index({ notifications }: { notifications: unknown[] }) {
    return (
        <div>
            <h1>Notifications</h1>
            <p>{notifications.length} notifications</p>
        </div>
    );
}
