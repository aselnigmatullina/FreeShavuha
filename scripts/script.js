document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    //Злементы
    const customer         = document.getElementById('customer')        ,
          freelancer       = document.getElementById('freelancer')      ,
          blockCustomer    = document.getElementById('block-customer')  ,
          blockFreelancer  = document.getElementById('block-freelancer'),
          blockChoice      = document.getElementById('block-choice')    ,
          btnExit          = document.getElementById('btn-exit')        ,
          formCustomer     = document.getElementById('form-customer')   ,
          ordersTabel      = document.getElementById('orders')          ,
          modalOrder       = document.getElementById('order_read')      ,
          modalOrderActive = document.getElementById('order_active')    ,
          headTabel        = document.getElementById('headTabel')       ;

    //получаем даные из local storage, если их нет то подготавливаем массив
    const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

    //сохранение в local storage
    const toStorage = () => {
        localStorage.setItem('freeOrders', JSON.stringify(orders));
    }

    //для склонения слов в зависимости от числа (1 день 2 дня 5 дней)
    const declOfNum = (number, titles) => number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ? 2 : 
        [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];

    //высчитываем дедлайн
    const calcDeadline = (date) => {
        const deadline = new Date(date);
        const toDay = Date.now();
        //сколько осталось (милисикунд)
        const remaining = (deadline - toDay) / 1000 / 60 / 60;
        //если меньше 2х дней то в часах
        if( (remaining / 24) > 2){
            return declOfNum(Math.floor(remaining / 24), ['день', 'дня', 'дней']);
        }

        return declOfNum(Math.floor(remaining), ['час', 'часа', 'часов']);
        
    }

    //отрисовка во фриланс таблице
    const renderOrders = () => {

        ordersTabel.textContent = '';

        orders.forEach( (order, i) => {

            ordersTabel.innerHTML += `
            <tr class="order ${order.active ? 'taken' : ''}" data-number-order="${i}">
                <td>${i + 1}</td>
                <td>${order.title}</td>
                <td class="${order.currency}"></td>
                <td>${calcDeadline(order.deadline)}</td>
            </tr>`;

        } );
        
    }

    //обработчик для события внутри модального окна
    const handlerModal = (event) => {
        const target = event.target;
        const modal = target.closest('.order-modal');
        const order = orders[modal.id];

        //закрываем модальное окно на крестик
        if(target.closest('.close') || target === modal ){
            modal.style.display = 'none';
        }

        //получаем заказ
        if(target.classList.contains('get-order')){
            order.active = true;
            modal.style.display = 'none';
            renderOrders();
            //сохраняем в localStorage
            toStorage();
        }

        //отменяем заказ
        if(target.id === 'capitulation' ){
            order.active = false;
            modal.style.display = 'none';
            renderOrders();
            //сохраняем в localStorage
            toStorage();
        }

        //выполнили заказ
        if(target.id === 'ready' ){
            //удаляем из таблицы заказ
            orders.splice(orders.indexOf(order), 1);
            modal.style.display = 'none';
            renderOrders();
            //сохраняем в localStorage
            toStorage();
        }

    }

    //сортировка обьектов в массиве
    const sortOrder = (arr, propperty) => {
        arr.sort( (a, b) => a[propperty] > b[propperty]  ? 1 : -1 );
    }

    //обработчик сортировка
    headTabel.addEventListener('click', (event) => {
        const target = event.target;
        if(target.classList.contains('head-sort')){

            if(target.id === 'taskSort'){
                sortOrder(orders, 'title');
            }

            if(target.id === 'currensySort'){
                sortOrder(orders, 'currensy');
            }

            if(target.id === 'deadlineSort'){
                sortOrder(orders, 'deadline');
            }

            toStorage();
            renderOrders();

        }
    });

    //обработчик для открытия  модальгого окна
    const openModal = (numberOrder) => {
        const order = orders[numberOrder];
        
        //через деструктуризацию получили значения order
        const { title, firstName, email, description, amount, currency, deadline , active = false} = order;

        //проверяем, активный ли заказ
        const modal = active ? modalOrderActive : modalOrder;

        //элементы форм 1 и 2
        const firstNameBlock   = modal.querySelector('.firstName'),
              titleBlock       = modal.querySelector('.modal-title'),
              emailBlock       = modal.querySelector('.email'),
              descriptionBlock = modal.querySelector('.description'),
              deadlineBlock    = modal.querySelector('.deadline'),
              currencyBlock    = modal.querySelector('.currency_img'),
              countBlock       = modal.querySelector('.count'),
              phoneBlock       = modal.querySelector('.phone');

              //заполняем формы
              modal.id                     = numberOrder;
              titleBlock.textContent       = title;
              firstNameBlock.textContent   = firstName;
              emailBlock.textContent       = email;
              emailBlock.href              = 'mailto:' + email;
              descriptionBlock.textContent = description;
              deadlineBlock.textContent    = calcDeadline(deadline);
              currencyBlock.className      = 'currency_img'; // при каждом открытие сбрасываем img класс в исходное состояние
              currencyBlock.classList.add(currency);
              countBlock.textContent       = amount;
              phoneBlock ? phoneBlock.href = 'tel:' + phone : '' ;
              


        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    }

    //обработчик фриланс - заказы
    ordersTabel.addEventListener('click', event => {
        const target = event.target;
        const targetOrder = target.closest('.order');

        if(targetOrder){
            openModal(targetOrder.dataset.numberOrder);
        }
  
    });


    //обработка заказчика
    customer.addEventListener('click', () => {
        blockCustomer.style.display = 'block';
        //минимальное значение даты заказа
        const toDay = new Date().toISOString().substring(0,10);  
        document.getElementById('deadline').min = toDay;

        blockChoice.style.display = 'none';
        btnExit.style.display = 'block';
    })

    //обработка фрилансера
    freelancer.addEventListener('click', () => {
        blockFreelancer.style.display = 'block';
        renderOrders();
        blockChoice.style.display     = 'none';
        btnExit.style.display         = 'block';
    })

    //паказываем главное меню
    btnExit.addEventListener('click',    () => {
        btnExit.style.display         = 'none';
        blockFreelancer.style.display = 'none';
        blockCustomer.style.display   = 'none';
        blockChoice.style.display     = 'block';
    })

    //обрабатываем форму заказчика
    formCustomer.addEventListener('submit', (event) => {
        event.preventDefault();
        const objElem = {};
        
        //Способ 1 получам из формы все элементы + значения
        const elements  = [...formCustomer.elements]
            .filter( (elem) => ( elem.tagName === "INPUT" && elem.type !== "radio" || 
            (elem.type === "radio" && elem.checked) || elem.tagName === "TEXTAREA") );

            elements.forEach( (elem) => {
                    objElem[elem.name] = elem.value;

            });
    
        //Способ 2 получам из формы все элементы + значения
        // [...formCustomer.elements].forEach( (elem) => {
        //     if(elem.tagName === "INPUT" && elem.type !== "radio" || 
        //     (elem.type === "radio" && elem.checked) || 
        //     elem.tagName === "TEXTAREA"  ) {
        //         objElem[elem.name] = elem.value;

        //         //очищаем если не radio
        //         if(elem.type !== 'radio'){
        //             elem.value = '';
        //         }

        //     }
        // } );

        //Способ 3 получам из формы все элементы + значения
        // for(const elem of formCustomer.elements){
        //     if(elem.tagName === "INPUT" && elem.type !== "radio" || 
        //     (elem.type === "radio" && elem.checked) || 
        //     elem.tagName === "TEXTAREA"  ) {
        //         objElem[elem.name] = elem.value;

        //         //очищаем если не radio
        //         if(elem.type !== 'radio'){
        //             elem.value = '';
        //         }

        //     }
        // }

        formCustomer.reset();

        //добавляем элементы формы заказа в массив
        orders.push(objElem);

        //сохраняем в localStorage
        toStorage();

    });

   
    
})

