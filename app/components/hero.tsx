import conf from '../index.json';
import clsx from 'clsx';

import { ReemKufi, NotoNastaliqUrdu } from '../ui/fonts';
import Image from 'next/image';
import { Fragment } from 'react';

export default function Hero() {

  const info = conf.about
  const navigation = conf.navigation
  const saying = conf.saying

  return (
    <section className="flex-1 grid md:grid-cols-2 overflow-x-hidden relative">
      <div className="absolute h-full w-full bg-mosque-shilouette bg-no-repeat bg-bottom opacity-5"></div>
        <div className="px-8 lg:px-32 flex flex-col justify-center align-between space-y-8">
            <h1 className={clsx("text-6xl mt-16", ReemKufi.className)} >
                {info.name}
            </h1>
            <p className="text-2xl text-gray-700">
                {info.about}
            </p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-8 overflow-y-hidden">
          <blockquote className={`[&>*:nth-child(even)]:text-end w-2/3 text-4xl ${NotoNastaliqUrdu.className} leading-loose`}>
            {
              saying.said.map((s, i) => (
                <p className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-500 text-transparent bg-clip-text" key={i}>
                  {s}
                </p>
              ))
            }
          </blockquote>
          <p className='self-start px-6'>
            {saying.author}
          </p>
        </div>

    </section>
  );
}
