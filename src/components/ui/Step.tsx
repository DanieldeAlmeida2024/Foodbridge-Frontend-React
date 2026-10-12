type Props = {
  number: string;
  title: string;
  desc: string;
};

export default function Step({ number, title, desc }: Props) {
  return (
    <div className="text-center">
      <div className="
        w-12 h-12 
        flex items-center justify-center 
        bg-blue-600 text-white 
        rounded-full 
        mx-auto mb-4
        font-bold
      ">
        {number}
      </div>

      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}