type Props = {
  label: string;
  value: string;
};

export default function Stat({ label, value }: Props) {
  return (
    <div className="
      bg-white 
      p-8 
      rounded-2xl 
      shadow-sm 
      hover:shadow-md 
      transition 
      text-center
    ">
      <h3 className="text-4xl font-bold mb-2">{value}</h3>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}