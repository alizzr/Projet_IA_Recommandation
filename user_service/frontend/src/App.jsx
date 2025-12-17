const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        status: "Payé",
        delivery: deliveryData,
        items: cart
    };
    setLastOrder(orderData);
    setCheckoutOpen(false);
    setInvoiceOpen(true);
    setCart([]); 
  };
=======
  const handleCheckoutSubmit = async (deliveryData) => {
    try {
      const orderResponse = await createOrder(user.id, deliveryData);
      setLastOrder(orderResponse.order);
      setCheckoutOpen(false);
      setInvoiceOpen(true);
      setCart([]);
    } catch (e) {
      console.error("Erreur lors de la création de la commande:", e);
      alert("Erreur lors de la création de la commande. Veuillez réessayer.");
    }
  };
