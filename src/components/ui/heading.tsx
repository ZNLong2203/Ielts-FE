interface HeadingProps {
    title: string,
    description: string
}

const Heading = ({ title, description }: HeadingProps) => {
    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

export default Heading