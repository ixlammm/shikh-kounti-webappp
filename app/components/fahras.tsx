import Image from "next/image";
import { Cairo } from "../ui/fonts";
import Link from "next/link";

export default function Fahras(props: { title: string, action: string, items: Array<{title: string, id:string, href: string, count: number}> }) {
    return (
        <div className={`flex flex-col items-center ${Cairo.className}`}>
        <div className="relative overflow-y-hidden h-80">
            <Image 
                alt="hadith books"
                width={2000}
                height={2000}
                quality={100}
                src="/timthumb.jpg"
                className="h-full object-cover"
            />
            <div className="absolute flex items-center justify-center w-full h-full bg-opacity-60 bg-black top-0 left-0 p-10">
                <h1 className="text-white font-bold text-6xl leading-relaxed">
                    {props.title}
                </h1>
            </div>
        </div>
        <div className="sticky top-0 px-5 py-5 w-full md:w-3/4 sm:mx-10 md:py-10 max-w-4xl">
            <div className="flex flex-row items-center mb-4">
                <h1 className="flex-none text-2xl">{props.action}</h1>
                <hr className="flex-1 h-px bg-gray-700 border-0 ms-2"></hr>
            </div>
            <ol className="">
                {props.items.map((item) => (
                    <li className="my-2 flex flex-row items-center" key={item.id}>
                        <Link href={item.href}>{item.title}</Link>
                        <hr className="flex-1 mx-2 border-1 border-gray-400 border-dashed"></hr>
                        <span className="bg-gray-400 text-white text-sm font-bold px-2 rounded float-left">{item.count}</span>
                    </li>
                ))}
            </ol>
        </div>
    </div>
    );
}