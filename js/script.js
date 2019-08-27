let serverURL;
let serverPort;
let editing = false;

$.ajax({
  url: 'config.json',
  type: 'GET',
  dataType: 'json',
  success:function(keys){
    serverURL = keys['SERVER_URL'];
    serverPort = keys['SERVER_PORT'];
    getProductsData();
  },
  error: function(){
    console.log('cannot find config.json file, cannot run application');
  }
});

getProductsData = () => {
    $.ajax({
        url: `${serverURL}:${serverPort}/allProducts`,
        type: 'GET',
        dataType: 'json',
        success:function(data){
            for (var i = 0; i < data.length; i++) {
                $('#productList').append(`
                    <li
                        class="list-group-item d-flex justify-content-between align-items-center productItem"
                        data-id="${data[i]._id}"
                    >
                        <span class="productName">${data[i].name}</span>
                        <div>
                            <button class="btn btn-info editBtn">Edit</button>
                            <button class="btn btn-danger removeBtn">Remove</button>
                        </div>
                    </li>
                `);
            }
        },
        error: function(err){
            console.log(err);
            console.log('something went wrong');
        }
    })
}

$('#productList').on('click', '.editBtn', function() {
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    $.ajax({
        url: `${serverURL}:${serverPort}/product/${id}`,
        type: 'get',
        dataType: 'json',
        success:function(product){
            console.log(product);
            $('#productName').val(product['name']);
            $('#productPrice').val(product['price']);
            $('#productID').val(product['_id']);
            $('#addProductButton').text('Edit Product').addClass('btn-warning');
            $('#heading').text('Edit Product');
            editing = true;
        },
        error:function(err){
            console.log(err);
            console.log('something went wrong with getting the single product');
        }
    })

});

$('#addProductButton').click(function(){
    event.preventDefault();
    let productName = $('#productName').val();
    let productPrice = $('#productPrice').val();
    if(productName.length === 0){
        console.log('please enter a products name');
    } else if(productPrice.length === 0){
        console.log('please enter a products price');
    } else {
        if(editing === true){
            const id = $('#productID').val();
            $.ajax({
                url: `${serverURL}:${serverPort}/editProduct/${id}`,
                type: 'PATCH',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productID').val(null);
                    $('#addProductButton').text('Add New Product').removeClass('btn-warning');
                    $('#heading').text('Add New Product');
                    editing = false;
                    const allProducts = $('.productItem');
                    allProducts.each(function(){
                        if($(this).data('id') === id){
                            $(this).find('.productName').text(productName);
                        }
                    });
                },
                error: function(err){
                    console.log(err);
                    console.log('something went wront with editing the product');
                }
            })
        } else {
            console.log(`${productName} costs $${productPrice}`);
            $.ajax({
                url: `${serverURL}:${serverPort}/product`,
                type: 'POST',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productList').append(`
                        <li class="list-group-item d-flex justify-content-between align-items-center productItem">
                            <span class="productName">${result.name}</span>
                            <div>
                                <button class="btn btn-info editBtn">Edit</button>
                                <button class="btn btn-danger removeBtn">Remove</button>
                            </div>
                        </li>
                    `);
                },
                error: function(error){
                    console.log(error);
                    console.log('something went wrong with sending the data');
                }
            })
        }

    }
})

$('#productList').on('click', '.removeBtn', function(){
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    const li = $(this).parent().parent();
    $.ajax({
      url: `${serverURL}:${serverPort}/products/${id}`,
      type: 'DELETE',
      success:function(result){
        console.log('you did it');
        // const allProducts = $('.productItem');
        // allProducts.each(function(){
        //     if($(this).data('id') === id){
        //         $(this).remove();
        //     }
        // });
        li.remove();
      },
      error:function(err) {
        console.log(err);
        console.log('something went wrong deleting the product');
      }
    })
});
