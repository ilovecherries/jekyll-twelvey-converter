module Jekyll
    module Converters
        class TwelveY < Converter
            safe false
            priority :low
            @@root = File.expand_path('_12y.js', File.dirname(__FILE__))

            def matches(ext)
                ext =~ /^\.12y$/i
            end

            def output_ext(ext)
                ".html"
            end

            def convert(content)
                `node #{@@root} <<EOF\n#{content}\nEOF`
            end   
        end
    end
end