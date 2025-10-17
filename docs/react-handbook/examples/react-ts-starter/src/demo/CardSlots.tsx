import React from "react"

export function Card({
  header,
  children,
  footer,
}: {
  header?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="border rounded p-3 w-80 bg-white shadow-sm">
      {header && <div className="mb-2">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-2 text-sm text-gray-500">{footer}</div>}
    </div>
  )
}

export function CardSlotsDemo() {
  return (
    <Card
      header={<div className="font-semibold">组合/插槽示例</div>}
      footer={<div>Footer 说明文本</div>}
    >
      <p>children 作为默认插槽区域</p>
    </Card>
  )
}

export default CardSlotsDemo