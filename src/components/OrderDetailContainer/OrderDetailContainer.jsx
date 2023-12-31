import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from 'firebase/firestore'
import {db} from '../../firebase/config'
import OrderDetail from "../OrderDetail/OrderDetail"
import './OrderDetailContainer.css'


export const OrderDetailContainer = () => {
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)

    const { itemId } = useParams()

    console.log(itemId)
    console.log(item)

    useEffect(() => {
        setLoading(true)


    // Armo la referencia
        const ordRef = doc(db, "orders", itemId)
    // Llamo referencia
    getDoc(ordRef)
            .then((doc) => {
               setItem({
                id: doc.id,
                ...doc.data()
               })
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(false))

    }, [])

    return (
        <div className="container">
            {
                loading
                    ? <h2>Cargando...</h2>
                    : <OrderDetail item={item}/>
            }
        </div>
    )
}
