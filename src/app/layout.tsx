export const metadata = {
  title: 'Mayur Operations System',
  description: 'Mayur Food Packaging Products — MOS',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0, padding:0, fontFamily:'Arial,sans-serif', background:'#F2F4F7'}}>
        {children}
      </body>
    </html>
  )
}
