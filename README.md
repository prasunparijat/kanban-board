Workflow - Kanban Board - The better to do list 🗒️

## How to use this ?

To get started - install all the dependencies via : `npm i` or any other package manager

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Takeaways :

- Usage of the custom data attributes in HTML element - Just pass `data-[keyname]={keyvalue}` as an attribute in the HTML tag and this data can be retreived whenver required. In HTML5, custom attributes that start with data- are used to store custom data in an HTML element. These attributes are not part of the standard HTML attributes, but they can be used to store additional information about an element.

```html
<div
  data-id="123"
  data-name="John Doer"
>
  Hello, world!
</div>
```

- Every event data can also carry metadata - like the context of the element on which the mouseDown (click) started and the other events like mouseDown (click leave) etc,. to utilise that info to create the action required.

- Framer motion's contianers like `motion.{HTML_TAG}` can utilise the layout atrribute to hanle the change in the layout without explicitly mentioning the aniamtion to be done - the re-arragements of the cards.

- `layoutId={SOME_UNIQUE_ID}` is requried by framer motion to handle similar components restructing int he flex or grid layout.

- Prop drilling till 2 layers is fine. Even the passing of the reference to a set function. useCallback can be used to negate the rerender of the child in this subsequent layers by passing down the memoized reference to the function for performance gains

- Further work : Implement the SSO layer to provide the login capability along with the DB to store the state of the board remotely. Only supports dektop drag and drop- mouseDown()
