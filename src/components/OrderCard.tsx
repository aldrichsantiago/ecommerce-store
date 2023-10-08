import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Plane } from "lucide-react";
import ProductCard from "./ProductCard"
import useAxios from "@/hooks/useAxios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "./ui/use-toast"
import { UseAuthProps } from "@/contexts/AuthProvider"
import useAuth from "@/hooks/useAuth"
import axios from "@/api/axios"

// TYPES
type StatusTypes = {
  to_pack: string,
  in_logistics: string,
  shipped: string,
  out_for_delivery: string,
  delivered: string,
  cancelled: string
}

const OrderCard = ({ orders }:any) => {
  const { response } = useAxios({
    method: 'get',
    url: `/orders/id/${orders.order_no}`,
    headers: JSON.stringify({ accept: '*/*' }),
  })
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { auth }:UseAuthProps = useAuth();

  const addToWishlist = async(id:number) => {
    if (auth) {
      try {
        const res = await axios.patch("/wishlist/user/" + auth.username + "/" + id, id);
        toast({ title: res.data.message });
      } catch (error) {

        console.log(error);
        toast({ title: JSON.stringify(error) })
        return;

      }
    } else{
      navigate("/login");
    }
  }

  useEffect(() => {
    if (response !== null) {
      setData(response);
    }
  }, [response]);


  let products: any = []

  for(const elem of data){
    for(const key in elem){
      if (key === "products"){
        products.push(elem[key]);
      }
    }
  }
  console.log(products);

  const localDate = new Date(orders?.createdAt).toLocaleString("en-US", {
    dateStyle: "full",
    // timeStyle: "short"
  });

  
  const status: StatusTypes = {
    to_pack: 'Your package is about to be packed',
    in_logistics: 'Your package is currently in logistics',
    shipped: 'Your package is currently being shipped',
    out_for_delivery: 'Your package is out for delivery',
    delivered: 'Your package is already delivered',
    cancelled: 'Your package is unforunately cancelled',
  }


  return (
    <div className="container py-10 w-full">
        <div className="container">
            <Card className="w-full">
              <CardHeader>
                <span className="flex flex-row justify-between">
                  <CardTitle className="">Order ID: {orders?.order_no}</CardTitle>
                  <Dialog>
                    <DialogTrigger><Button className="w-full bg-green-900">Track Order</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Where is your parcel?</DialogTitle>
                        <DialogDescription>

                          {status[orders?.status as keyof typeof status]}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </span>
                <span className="flex">
                  <CardDescription className="font-medium flex gap-1">Order Date: <p className="font-bold">{localDate}</p></CardDescription>
                  <Separator orientation="vertical" className="w-px h-5 mx-5"/>
                  <CardDescription className="flex gap-1 text-green-500 font-medium"><Plane /> Estimated delivery: <p className="font-bold">{localDate}</p> </CardDescription>
                </span>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4 horizontal" data-orientation="horizontal" type="hover">
                      <div className="flex flex-wrap justify-around">
                        {products?.map(({id, name, description, price, ratings, images, quantitySold}:any)=> (
                        <ProductCard key={id}
                        id={id} 
                        name={name} 
                        description={description} 
                        price={price} 
                        ratings={ratings} 
                        images={images}
                        quantitySold={quantitySold}
                        disp={true}
                        addToWishlist={addToWishlist}/>
                      ))}
                      </div>
                    </ScrollArea>
                    </div>
                    <div className="flex justify-between px-4">
                      <span className="flex flex-col space-y-1.5">
                        <span className="flex">
                          <Label className="text-slate-600">Payment Method: </Label>
                          <Label className="ml-2 font-bold">{orders?.paymentMethod.toUpperCase()}</Label>
                        </span>
                        <span className="flex">
                          <Label className="text-slate-600">Shipping Address: </Label>
                          <Label className="ml-2 font-bold">{orders?.shippingAddress}</Label>
                        </span>
                        
                      </span>
                      <span className="w-32 flex flex-col space-y-1.5">
                        <span className="flex justify-between">
                          <Label>Subtotal: </Label>
                          <Label className="text-right">${orders?.subtotal}</Label>
                        </span>
                        <span className="flex justify-between">
                          <Label>Shipping: </Label>
                          <Label className="text-right">${orders?.shippingAmount}</Label>
                        </span>
                        <Separator/>
                        <span className="flex justify-between">
                          <Label>Total: </Label>
                          <Label className="text-right">${(orders?.shippingAmount+orders?.subtotal)}</Label>
                        </span>
                      </span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default OrderCard