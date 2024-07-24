import { Fragment } from "react";
import Header from "@/app/components/header";
import { Cairo } from "@/app/ui/fonts";
import { MongoClient, WithId } from "mongodb";
import Image from 'next/image'
import conf from '@/app/index.json';
import { AlMuwattta, FahrasItem } from "@/app/database";
import Fahras from "@/app/components/fahras";

// const uri = "mongodb+srv://ixlammm:dpMWVJEDMQiFhw1p@al-muwatta.ayvkr7g.mongodb.net/?retryWrites=true&w=majority&appName=al-muwatta";

export async function getStaticProps() {
    return {
        props: {
            fahras: await AlMuwattta.getFahras()
        },
        revalidate: 60
    }
}

export default function Home(props: { fahras: Array<FahrasItem> }) {

    return (
        <Fragment>
            <Header page="al-muwatta"/>
            <Fahras 
                title={conf.navigation.find((value) => value.en == "al-muwatta" )!.ar} 
                action="تصفح الكتب"
                items={props.fahras.map((item) => ({
                    title: item.title,
                    count: item.count,
                    href: `/al-muwatta/${item.id}`,
                    id: item.id
                }))}
                />
        </Fragment>
    )
}