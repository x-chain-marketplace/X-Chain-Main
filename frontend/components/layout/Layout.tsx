import { Container, Flex, Icon, SimpleGrid, Text, createIcon } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { Head, MetaProps } from './Head'

interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}

export const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  return (
    <>
      <Head customMeta={customMeta} />
      <header>
        <Container maxWidth="container.xl">
          <SimpleGrid
            columns={[1, 1, 1, 2]}
            alignItems="center"
            justifyContent="space-between"
            py="8"
          >
            <Flex>
              <Icon viewBox='0 0 296 300' color='red.500'>
                <svg width="296" height="319" viewBox="0 0 296 319" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="logo">
                <g id="circle-base">
                <circle cx="148.031" cy="158.641" r="87.7901" fill="url(#paint0_linear_18_2553)"/>
                <circle cx="148.031" cy="158.641" r="87.7901" fill="#FF6600"/>
                </g>
                <g id="arrow-bottom" filter="url(#filter0_d_18_2553)">
                <path d="M221.843 134.548C215.912 135.819 212.107 141.6 213.33 147.492C219.091 175.228 206.37 203.442 181.694 217.689C157.017 231.936 126.23 228.841 105.08 209.99C101.564 206.858 96.4136 206.338 92.3066 208.709L45.4096 235.785L48.0616 226.028C49.6468 220.207 46.1996 214.236 40.3614 212.691C34.5231 211.146 28.5148 214.62 26.9281 220.447L17.351 255.661C17.1658 256.354 17.0477 257.067 16.9944 257.788C16.9756 258.114 17.014 258.444 17.0219 258.769C17.0278 259.154 17.012 259.533 17.0605 259.913C17.1119 260.313 17.2279 260.689 17.3198 261.08C17.3958 261.379 17.4347 261.686 17.5393 261.986C17.7709 262.667 18.0616 263.322 18.42 263.943C18.424 263.949 18.4368 263.956 18.4408 263.963C18.7952 264.576 19.2078 265.148 19.6752 265.678C19.9017 265.927 20.1544 266.133 20.3922 266.361C20.6657 266.62 20.9258 266.895 21.2278 267.123C21.5526 267.374 21.9129 267.559 22.2584 267.767C22.5188 267.923 22.7616 268.112 23.0368 268.246C23.6881 268.56 24.3665 268.818 25.0586 269.003L60.3371 278.321C63.2553 279.091 66.2162 278.612 68.6444 277.21C71.0796 275.804 72.9753 273.48 73.7669 270.567C75.3521 264.745 71.9049 258.775 66.0667 257.23L56.2906 254.648L96.649 231.347C124.436 251.899 162.02 254.192 192.582 236.547C225.497 217.544 242.451 179.927 234.777 142.943C233.555 137.054 227.767 133.291 221.843 134.548Z" fill="white"/>
                </g>
                <g id="arrow-top" filter="url(#filter1_d_18_2553)">
                <path d="M73.5098 184.262C79.4405 182.992 83.2456 177.21 82.0223 171.318C76.2612 143.583 88.9822 115.369 113.659 101.122C138.335 86.8747 169.123 89.9689 190.272 108.82C193.789 111.952 198.939 112.472 203.046 110.101L249.943 83.0249L247.291 92.7822C245.706 98.6038 249.153 104.574 254.991 106.119C260.829 107.664 266.838 104.191 268.424 98.3636L278.002 63.1489C278.187 62.4567 278.305 61.7438 278.358 61.0225C278.377 60.6962 278.339 60.3663 278.331 60.0416C278.325 59.6563 278.34 59.2768 278.292 58.8978C278.241 58.4977 278.125 58.1212 278.033 57.7307C277.957 57.4316 277.918 57.1248 277.813 56.824C277.582 56.1438 277.291 55.4886 276.933 54.8678C276.929 54.861 276.916 54.8547 276.912 54.8478C276.557 54.2339 276.145 53.6628 275.677 53.1325C275.451 52.8837 275.198 52.6775 274.96 52.449C274.687 52.1908 274.427 51.9157 274.125 51.6877C273.8 51.4362 273.44 51.251 273.094 51.0435C272.834 50.8875 272.591 50.6984 272.316 50.5647C271.664 50.2503 270.986 49.9926 270.294 49.8069L235.015 40.4896C232.097 39.7189 229.136 40.1984 226.708 41.6003C224.273 43.0063 222.377 45.3308 221.586 48.2433C220 54.0649 223.448 60.0356 229.286 61.5804L239.062 64.1623L198.704 87.4632C170.917 66.9115 133.333 64.6179 102.771 82.2631C69.856 101.266 52.9017 138.884 60.5757 175.867C61.7971 181.756 67.5855 185.52 73.5098 184.262Z" fill="white"/>
                </g>
                <g id="chain-center" filter="url(#filter2_d_18_2553)">
                <path d="M131.786 123.846C129.766 125.855 128.165 128.245 127.074 130.878C125.984 133.51 125.426 136.332 125.434 139.182L125.435 154.556C125.432 157.825 126.169 161.052 127.591 163.996C129.013 166.94 131.082 169.524 133.644 171.555C136.206 173.585 139.195 175.01 142.385 175.722C145.576 176.434 148.887 176.415 152.069 175.666L152.068 165.087C150.294 165.922 148.339 166.295 146.382 166.172C144.426 166.049 142.532 165.434 140.877 164.383C139.222 163.332 137.86 161.881 136.916 160.163C135.972 158.445 135.477 156.516 135.477 154.556L135.477 139.182C135.473 136.165 136.641 133.265 138.734 131.092C140.827 128.92 143.682 127.645 146.696 127.537C149.711 127.428 152.65 128.495 154.893 130.511C157.137 132.527 158.51 135.336 158.724 138.345C161.877 139.759 164.746 141.738 167.188 144.185C167.757 144.753 168.293 145.346 168.806 145.953L168.807 139.181C168.807 134.892 167.535 130.699 165.152 127.133C162.769 123.567 159.382 120.787 155.42 119.146C151.457 117.504 147.097 117.075 142.89 117.911C138.683 118.748 134.819 120.813 131.786 123.846Z" fill="white"/>
                <path d="M142.172 143.144L142.173 153.729C143.946 152.893 145.901 152.518 147.858 152.641C149.814 152.763 151.708 153.377 153.363 154.427C155.019 155.477 156.382 156.929 157.326 158.647C158.27 160.365 158.764 162.293 158.763 164.254L158.764 179.628C158.768 182.645 157.6 185.545 155.507 187.717C153.414 189.89 150.559 191.164 147.545 191.273C144.53 191.381 141.591 190.315 139.347 188.299C137.104 186.283 135.73 183.474 135.517 180.465C132.363 179.05 129.494 177.071 127.052 174.625C126.483 174.056 125.948 173.464 125.434 172.857L125.434 179.629C125.434 185.38 127.719 190.896 131.786 194.963C135.853 199.03 141.369 201.315 147.121 201.315C152.872 201.315 158.388 199.03 162.455 194.963C166.522 190.896 168.807 185.38 168.807 179.628L168.806 164.253C168.808 160.984 168.071 157.757 166.649 154.813C165.228 151.869 163.158 149.285 160.596 147.255C158.034 145.224 155.046 143.799 151.855 143.087C148.665 142.375 145.354 142.395 142.172 143.144Z" fill="white"/>
                </g>
                </g>
                <defs>
                <filter id="filter0_d_18_2553" x="16.9893" y="134.306" width="219.615" height="145.381" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_18_2553"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_18_2553" result="shape"/>
                </filter>
                <filter id="filter1_d_18_2553" x="58.748" y="40.123" width="219.615" height="145.381" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_18_2553"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_18_2553" result="shape"/>
                </filter>
                <filter id="filter2_d_18_2553" x="125.434" y="117.495" width="43.3733" height="84.32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_18_2553"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_18_2553" result="shape"/>
                </filter>
                <linearGradient id="paint0_linear_18_2553" x1="118.768" y1="100.114" x2="206.558" y2="280.572" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0076FC"/>
                <stop offset="1" stop-color="#0860B9"/>
                </linearGradient>
                </defs>
                </svg>
            </Icon>
            <Text>HEllo World</Text>
            </Flex>
            <Flex
              order={[-1, null, null, 2]}
              alignItems={'center'}
              justifyContent={['flex-start', null, null, 'flex-end']}
            >
              <ConnectButton />
            </Flex>
          </SimpleGrid>
        </Container>
      </header>
      <main>
        <Container maxWidth="container.xl">{children}</Container>
      </main>
    </>
  )
}
