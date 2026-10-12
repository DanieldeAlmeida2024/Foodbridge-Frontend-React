type Props = {
  title: string;
  desc: string;
};

export default function Feature({ title, desc }: Props) {
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
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}