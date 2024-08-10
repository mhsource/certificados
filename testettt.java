import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SeuServicoTest {

    @Mock
    private AcordoMapper acordoMapper;

    @Mock
    private AcordoRepository acordoRepository;

    @InjectMocks
    private SeuServico servico;

    @Test
    public void testGravaCadastro() {
        // Configurando os mocks
        ContasAcordoEntity entity = new ContasAcordoEntity();
        AcordoEntity acordoEntity1 = new AcordoEntity();
        AcordoEntity acordoEntity2 = new AcordoEntity();
        List<AcordoEntity> outputDataList = Arrays.asList(acordoEntity1, acordoEntity2);
        ContasAcordoEntity expectedReturnEntity = new ContasAcordoEntity();

        // Configurando o comportamento do mapper e do repository
        when(acordoMapper.toOutputDataList(entity)).thenReturn(outputDataList);
        when(acordoMapper.toInputData(outputDataList)).thenReturn(expectedReturnEntity);

        // Chamando o método a ser testado
        ContasAcordoEntity result = servico.gravaCadastro(entity);

        // Verificando interações
        verify(acordoMapper).toOutputDataList(entity);
        verify(acordoRepository).save(acordoEntity1);
        verify(acordoRepository).save(acordoEntity2);
        verify(acordoMapper).toInputData(outputDataList);

        // Verificando o resultado
        assertEquals(expectedReturnEntity, result);
    }
}
