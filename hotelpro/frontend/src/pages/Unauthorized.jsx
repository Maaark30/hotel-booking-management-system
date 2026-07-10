import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
      <Link to="/dashboard" className="text-blue-600">Back to Dashboard</Link>
    </div>
  );
}