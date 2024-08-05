import Fahras from "@/app/components/fahras";
import Header from "@/app/components/header";
import { AlMuwattta, BookItem } from "@/app/database";
import { Fragment } from "react";

export async function getStaticPaths() {
    let fahras = await AlMuwattta.getFahras();

    return {
        paths: fahras.map((item, i) => ({
            params: {
                book_id: item.id.toString(),
            }
         })),
        fallback: "blocking"
    }
}

export async function getStaticProps({ params }: { params: { book_id: string } }) {
    let book = await AlMuwattta.getBook(parseInt(params.book_id))
    
    return {
        props: {
            book: book
        },
        revalidate: 20,
    }
}

export default function Home(props : { book: BookItem }) {
    return (
        <Fragment>
        <Header page="al-muwatta"/>
        <Fahras 
            title={props.book.title} 
            action={`تصفح ${props.book.title}`}
            items={props.book.babs.map((item) => ({
                title: item.title,
                count: item.count,
                href: `./${props.book.id}/${item.bab_id}`,
                id: item.bab_id
            }))}
            />
        </Fragment>
    )
}