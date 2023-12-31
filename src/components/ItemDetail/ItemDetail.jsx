import './ItemDetail.css'
import { useContext, useState } from "react"
import { CartContext } from "../../context/CartContext"
import ItemCount from '../ItemCount/ItemCount'

const ItemDetail = ({item}) => {
    const { agregarAlCarrito } = useContext(CartContext)

    const [cantidad, setCantidad] = useState(1)

    const handleAgregar = () => {
        const newItem = {
            ...item,
            cantidad
        }

        agregarAlCarrito(newItem)
    }

    return (
        <div className="container">
            <div className="row">
            <h2>{item.nombre}</h2>
            <div className="col-md-6">
            <img src={item.img} alt={item.nombre}/>
            </div>
            <div className="col-md-6">
            <p>{item.description}</p>
            <p><span>Precio: ${item.precio}</span></p>
            
            {
             <ItemCount 
                        max={item.stock}
                        cantidad={cantidad}
                        setCantidad={setCantidad}
                        agregar={handleAgregar}
                    />
            }
            </div>
            </div>
        </div>
    )
}

export default ItemDetail