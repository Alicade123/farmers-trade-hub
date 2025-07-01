function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  );
}
