import { Fragment } from 'react';
import Header from '@/app/components/header';
import Hero from '@/app/components/hero';
import conf from '@/app/index.json';

import { ReemKufi } from '@/app/ui/fonts';

export default function Home() {

  const info = conf.about
  const navigation = conf.navigation

  return (
    <Fragment>
      <Header page="home"/>
      <Hero />
    </Fragment>
  );
}
