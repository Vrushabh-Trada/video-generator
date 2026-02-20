'use client';

interface DoctorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DoctorInput: React.FC<DoctorInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
        Doctor Name
      </label>
      <input
        type="text"
        id="doctorName"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        placeholder="e.g. Dr. Rajesh Shah"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={50}
        required
      />
      <p className="text-xs text-gray-500 mt-1">This name will appear on the generated video.</p>
    </div>
  );
};
