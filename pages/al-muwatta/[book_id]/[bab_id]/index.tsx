import Fahras from "@/app/components/fahras";
import Header from "@/app/components/header";
import { AlMuwattta, BabItem, BookItem } from "@/app/database";
import { Fragment } from "react";
import { Cairo, Amiri } from "@/app/ui/fonts";
import Link from "next/link";

export async function getStaticPaths() {
    let fahras = await AlMuwattta.getFahras();
    let babs = []
    for (const book of fahras) {
        let qbabs = await (await AlMuwattta.getBook(parseInt(book.id))).babs
        for (const bab of qbabs) {
            babs.push({
                book_id: book.id,
                bab_id: bab.bab_id
            });
        }
    }
    return {
        paths: babs.map((bab) => ({
            params: {
                book_id: bab.book_id.toString(),
                bab_id: bab.bab_id.toString()
            }
        })),
        fallback: "blocking"
    }
}

export async function getStaticProps({ params }: { params: { book_id: string, bab_id: string } }) {
    let book = await AlMuwattta.getBab(parseInt(params.book_id), parseInt(params.bab_id))
    
    return {
        props: {
            book: book
        },
        revalidate: 20,
    }
}

export default function Home(props : { book: BabItem }) {
    return (
        <Fragment>
        <Header page="al-muwatta"/>
        <div className="flex flex-col items-center">
            <div className={`w-3/4 mt-10 text-xl p-5 ${Cairo.className}`}>
                <span>
                    <a className="text-blue-400 underline" href={`./`}>{props.book.book_title}</a>
                    <span className="mx-2 text-2xl">/</span>
                    <a>{props.book.bab.title}</a>
                </span>
                {
                    props.book.bab.text.map((item, i) => (
                        <div key={i} className="border-2 bg-gray-100 rounded my-5 p-10">
                            <p className={`leading-loose border-gray-300 ${Amiri.className}`}>
                                {
                                    item["plain"]
                                }
                            </p>
                            <a href={`./${props.book.bab.bab_id}/${i}`} className="text-blue-500">الذهاب الى الشرح</a>
                        </div>
                    ))
                }
            </div>
        </div>
        </Fragment>
    )
}