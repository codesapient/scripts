## Show custom upsell product in slide cart app
###### To Show Upsells product based on cart items. You can assign upsell products to product in metafields. i.e metafield namespace: product , key: upsell_products and value: product-handle1|product-handle 2

## JS Code
```
window.SLIDECART_UPDATED = function() {
  upsellProducts();
}

function upsellProducts(){
  $(".slidecarthq .upsell_products").remove();
  $.ajax({
    type: "GET",
    url: window.root_url + '/cart?view=upsells',
    success:function (upsellProducts) {
      $(".slidecarthq .footer").before('<div class="upsell_products"></div>');
      $(".upsell_products").append(upsellProducts);             
    },
    error: function (data) {
      console.log('An error occurred.');
    },
  });
}

$(document).on("change", ".upsell_variants", function(){
  var variantPrice = $(this).find(":selected").data('price');
  $(this).prev('.price').text(variantPrice);
  $(this).parent().siblings(".action").find('.upsell_atc').attr('data-variant-id', $(this).val());
});

$(document).on("click", ".upsell_atc", function(e){
  e.preventDefault();
  var that = this;
  $(that).prop("disabled", true)
  var variant_id = $(that).data('variant-id');    
  $.ajax({
    type: "POST",
    url: '/cart/add.js',
    data: 'quantity=1&id=' + variant_id,
    dataType:'json',
    success:function (product) {
      $(that).parent(".action").parent(".upsell_product").remove();
      window.SLIDECART_UPDATE(cartUpdate);        
    },
    error: function (data) {
      console.log('An error occurred.');
    },
  });
});

$(document).on("change", ".upsell_options", function(){
  var values = new Array();
  $(this).parent().parent().find(".upsell_options").find(":selected").each(function(){
    values.push($(this).val());
  });
  var selected_variant = values.join(" / ");
  console.log(selected_variant);
  if ($(this).parent().siblings(".upsell_variants").find("option[data-value='"+selected_variant+"']").length) {
    $(this).parent().siblings(".upsell_variants").find("option[data-value='"+selected_variant+"']").prop('selected', true);
    $(this).parent().siblings(".upsell_variants").trigger('change');
    $(this).closest(".product_info").siblings(".action").find(".upsell_atc").prop("disabled", false);
  }else{
    $(this).closest(".product_info").siblings(".action").find(".upsell_atc").prop("disabled", true);
  }
});

function cartUpdate(){
	jQuery.getJSON('/cart.js', function(cart) {
        return cart;
    });
}
```
## Create cart.upsells.liquid template
```
{% layout none %}
{% assign product_upsells = "" %}
{%- for item in cart.items -%}
	{% assign product_upsells = product_upsells | append:"|" | append: item.product.metafields.product.upsell_products %}
{%- endfor -%}
{%- for item in cart.items -%}
    {% assign item_to_remove = item.product.handle | prepend:"|" %}
	{% assign product_upsells = product_upsells | remove: item_to_remove %}
{%- endfor -%}
{% assign product_upsells = product_upsells | remove_first: "|" %}
{% assign product_upsells =  product_upsells | split: "|" %}
{% assign i = 0 %}
{% for upsell in product_upsells %}
  {%- assign upsell_product = all_products[upsell] -%}
  {% unless upsell_product.error and i <= 2 %}
    {%- assign featured_media = upsell_product.selected_or_first_available_variant.featured_media | default: upsell_product.featured_media -%}
    <div class='upsell_product'>
      <div class='image'><img src="{{ featured_media | img_url:'100x' }}" alt="{{ upsell_product.title }}"/></div>
      <div class='product_info'>
        <h3>{{ upsell_product.title }}</h3>
        <div class='price'>{{ upsell_product.selected_or_first_available_variant.price | money }}</div>
        <select class="upsell_variants js-hidden" name='upsell_variants'>
          {% for variant in upsell_product.variants %}
          	<option value="{{ variant.id }}" data-value="{{ variant.title | escape }}" data-price="{{ variant.price | money }}" {%- if variant == upsell_product.selected_or_first_available_variant %} selected="selected" {%- endif -%}>{{ variant.title }}</option>
          {% endfor %}
        </select>
        {% unless upsell_product.has_only_default_variant %}
          {% for option in upsell_product.options_with_values %}
            <div class='option_container'>
              <label>{{ option.name}}</label>
              <select class="upsell_options" id="upsell_options_{{ forloop.index0 }}" name='upsell_options'>
                {% for value in option.values %}
                	<option value="{{ value | escape }}" {% if option.selected_value == value %} selected="selected"{% endif %}>{{ value }}</option>
                {% endfor %}                    
              </select>
            </div>
          {% endfor %}
        {% endunless %}
      </div>
      <div class='action'><button class='upsell_atc'  data-variant-id="{{ upsell_product.selected_or_first_available_variant.id }}">{{ 'products.product.add_to_cart' | t }}</button></div>
    </div>
	{% assign i = i|plus:1 %}
  {% endunless %}
{% endfor %}
```
