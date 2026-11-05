export default function StrengthMeter({ value }: { value: number }) {
  return (
    <div
      role="meter"
      aria-label="Word strength"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={value}
      className="flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2 w-4 rounded-sm ${i <= value ? 'bg-green-500' : 'bg-slate-300'}`}
        />
      ))}
    </div>
  );
}
