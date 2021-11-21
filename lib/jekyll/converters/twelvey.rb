module Jekyll
    module Converters
        class TwelveY < Converter
            safe false
            priority :low

            def matches(ext)
                ext =~ /^\.12$/i
            end

            def output_ext(ext)
                ".html"
            end

            def convert(content)
                `node _12y.js <<EOF\n#{content}\nEOF`
            end   
        end
    end
end